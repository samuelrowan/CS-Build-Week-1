import React, { useState, useCallback, useRef } from "react";
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
} from "reactstrap";
import produce from "immer";

const operations = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

let gridHistory = [];
let gen = 0;
function App() {
  function reset() {
    window.location.reload(false);
  }
  const [rowsState, setRowsState] = useState(25);
  const [speedState, setSpeedState] = useState(1000);
  let numRows = rowsState;
  let numColumns = 25;
  const [grid, setGrid] = useState(() => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numColumns), () => false));
    }
    return rows;
  });
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(isRunning);
  runningRef.current = isRunning;
  function buildGrid() {
    return grid.map((rows, i) =>
      rows.map((column, j) => (
        <div
          key={`${i}-${j}`}
          onClick={() => {
            const newGrid = produce(grid, (placeholder) => {
              placeholder[i][j] = !placeholder[i][j];
            });
            setGrid(newGrid);
          }}
          style={{
            width: 20,
            height: 20,
            backgroundColor: grid[i][j] ? "black" : undefined,
            border: "solid 1px purple",
          }}
        />
      ))
    );
  }
  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numColumns; j++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (
                newI >= 0 &&
                newI < numRows &&
                newJ >= 0 &&
                newJ < numColumns
              ) {
                neighbors += g[newI][newJ];
              }
            });
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][j] = false;
            } else if (g[i][j] === false && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });
    gen = gen + 1;
    console.log(gen);
    setTimeout(runSimulation, speedState);
  }, []);
  return (
    <>
      <Button
        onClick={() => {
          setIsRunning(!isRunning);
          if (!isRunning) {
            runningRef.current = true;
            runSimulation();
          }
        }}
      >
        {isRunning ? "Stop" : "Start"}
      </Button>
      <Button
        onClick={() => {
          setIsRunning(!isRunning);
          runSimulation();
          setTimeout(setIsRunning(!isRunning), 999);
        }}
      >
        {isRunning ? "" : "Next"}
      </Button>
      {/* <Button onClick={this.forceUpdate()}>Start Over</Button> */}
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>Grid Size</InputGroupText>
        </InputGroupAddon>
        <Input
          placeholder="25"
          min={10}
          max={100}
          type="number"
          step="1"
          onChange={(e) => {
            setRowsState(e.target.value);
            setGrid(grid);
            console.log(rowsState);
          }}
        />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>speed </InputGroupText>
        </InputGroupAddon>
        <Input
          placeholder="1000"
          min={1000}
          max={10000}
          type="number"
          step="1"
          onChange={(e) => {
            setSpeedState(e.target.value);
            console.log(speedState);
          }}
        />
      </InputGroup>

      <h1>Generation: {gen}</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numColumns}, 25px)`,
        }}
      >
        {buildGrid()}
      </div>
      <h2>Rules</h2>
      <h3>
        Any live cell with fewer than two live neighbours dies, as if by
        underpopulation. Any live cell with two or three live neighbours lives
        on to the next generation. Any live cell with more than three live
        neighbours dies, as if by overpopulation. Any dead cell with exactly
        three live neighbours becomes a live cell, as if by reproduction.
      </h3>
    </>
  );
}

export default App;
