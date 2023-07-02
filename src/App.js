import './App.css'
import { useState, useEffect } from 'react'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

import io from "socket.io-client"

function App() {

  const [socket, setSocket] = useState(null)
  useEffect(() => {
    setSocket(io.connect("http://localhost:3001"))
  }, [])

  // client state
  const [room, setRoom] = useState("")
  const [playerName, setPlayerName] = useState("")

  // server state
  const [player, setPlayer] = useState([])
  const [gameStatus, setGameStatus] = useState(false)
  const [activeBox, setActiveBox] = useState({})
  const [dropButton, setDropButton] = useState([])
  const [table, setTable] = useState([])
  const [playerTurn, setPlayerTurn] = useState()
  const [winner, setWinner] = useState('...')

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("joinRoom", { room, playerName })
    }
  }
  const reStartGame = () => {
    socket.emit("reStartGame", { room })
  }

  const reportWinner = (player, scoreArr) => {
    if (Math.max(...scoreArr) >= 4) {
      setWinner(player)
      setGameStatus(false)
    }
  }

  const returnPoint = (column, row, player) => {
    if (column >= 1 && column <= 12 && row >= 1 && row <= 8) {
      console.log(row, column)
      if (table.filter((box) => (box.symbol === player && box.column === column && box.row === row)).length !== 0) {
        return 1
      } else {
        return 0
      }
    }
    else {
      return 0
    }
  }

  useEffect(() => {
    if (activeBox !== undefined) {
      console.log('activeBox', activeBox)
      var symbol = table.filter((box) => (box.column === activeBox.column && box.row === activeBox.row))[0]?.symbol
      var x_score = -1
      for (var i = activeBox.column; i <= 12; i++) {
        if (returnPoint(i, activeBox.row, symbol) === 0) { break }
        x_score += returnPoint(i, activeBox.row, symbol)
      }
      for (var i = activeBox.column; i >= 1; i--) {
        if (returnPoint(i, activeBox.row, symbol) === 0) { break }
        x_score += returnPoint(i, activeBox.row, symbol)
      }
      // console.log('x_score', x_score)
      var y_score = 0
      for (var j = activeBox.row; j >= 1; j--) {
        if (returnPoint(activeBox.column, j, symbol) === 0) { break }
        y_score += returnPoint(activeBox.column, j, symbol)
      }
      // console.log('y_score', y_score)
      var right_slope_score = -1
      var right_up_slope = 0
      for (var i = activeBox.row; i <= 8; i++) {
        if (returnPoint(activeBox.column + right_up_slope, i, symbol) === 0) { break }
        right_slope_score += returnPoint(activeBox.column + right_up_slope, i, symbol)
        right_up_slope += 1
      }
      var right_down_slope = 0
      for (var i = activeBox.row; i >= 1; i--) {
        if (returnPoint(activeBox.column - right_down_slope, i, symbol) === 0) { break }
        right_slope_score += returnPoint(activeBox.column - right_down_slope, i, symbol)
        right_down_slope += 1
      }
      // console.log('right_slope_score', right_slope_score)
      var left_slope_score = -1
      var left_up_slope = 0
      for (var i = activeBox.row; i <= 8; i++) {
        if (returnPoint(activeBox.column - left_up_slope, i, symbol) === 0) { break }
        left_slope_score += returnPoint(activeBox.column - left_up_slope, i, symbol)
        left_up_slope += 1
      }
      var left_down_slope = 0
      for (var i = activeBox.row; i >= 1; i--) {
        if (returnPoint(activeBox.column + left_down_slope, i, symbol) === 0) { break }
        left_slope_score += returnPoint(activeBox.column + left_down_slope, i, symbol)
        left_down_slope += 1
      }
      // console.log('left_slope_score', left_slope_score)
      reportWinner(symbol, [x_score, y_score, right_slope_score, left_slope_score])
    }


  }, [activeBox])


  const onClickDropButton = (column, row, playerTurn, room) => {
    socket.emit("clickDropButton", { column, row, playerTurn, room })
  }


  useEffect(() => {
    if (socket !== null) {
      socket.on("returnRoomState", (data) => {
        console.log('returnRoomState', data)

        setPlayer([data[0].player1, data[0].player2])
        setGameStatus(data[0].gameStatus)
        setActiveBox(data[0].activeBox)
        setPlayerTurn(data[0].playerTurn)
        setDropButton(data[0].dropButton)
        setTable(data[0].table)

      })
    }
  }, [socket])


  return (
    <>
      <div className='flex flex-wrap w-full mt-[10px] mb-[15px] px-[100px]'>
        <div className='w-2/12 p-1'>
          <input
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            placeholder="name..."
            onChange={(event) => {
              setPlayerName(event.target.value)
            }}
          />
        </div>
        <div className='w-2/12 p-1'>

          <input
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            placeholder="Room Number..."
            onChange={(event) => {
              setRoom(event.target.value)
            }}
          />
        </div>
        <div className='w-1/12 p-1'>
          <button className='border h-full px-[5px] rounded-lg bg-sky-600' onClick={joinRoom}> Join Room</button>
        </div>
      </div>


      <div className='flex flex-wrap w-full mt-[10px] mb-[15px] px-[100px]'>
        <div className='w-1/2 p-1'>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
          >{player[0] !== undefined ? player[0].name : 'sit!'}</button>
        </div>
        <div className='w-1/2 p-1'>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
          >{player[1] !== undefined ? player[1].name : 'sit!'}</button>
        </div>
      </div>
      <div className='flex flex-wrap w-full mt-[10px] mb-[15px] px-[100px]' >
        <p style={{ display: player[0] !== undefined && player[1] !== undefined ? 'block' : 'none' }}>{playerTurn}'s turn</p>
      </div>


      <div className='flex flex-wrap w-full mt-[10px] mb-[15px] px-[100px]'>
        {
          dropButton.map((button) => (
            <div key={button.column} className='w-1/12 p-1'>
              <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full' disabled={!gameStatus || (playerName !== playerTurn)} onClick={() => { onClickDropButton(button.column, button.row, playerTurn, room) }}>{button.column}</button>
            </div>
          ))
        }
      </div>
      <div className='flex flex-wrap w-full px-[100px]'>
        {
          table.map((table, index) => (
            <div key={`${index}-row-${table.row}-column-${table.column}`} className='w-1/12 p-1'>
              <div className='flex justify-center items-center h-[50px] border-2'>
                {table.symbol === player[0]?.name ? <PlusCircleOutlined className='text-[24px] text-rose-500' />
                  : table.symbol === player[1]?.name ? <MinusCircleOutlined className='text-[24px] text-purple-600' />
                    : ''}
              </div>
            </div>
          ))
        }
      </div>
      <div className='w-full px-[100px] mt-[10px] mb-[15px]'>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full' onClick={() => { reStartGame() }}>restart!</button>
      </div>
      <div className='flex  justify-center'>
        <h1>winner is {winner}</h1>
      </div>
    </>
  );
}

export default App;
