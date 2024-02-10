import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { CameraUpdater } from "../components/CameraUpdater";
import CoordinateAxes from "../components/CoordinateAxes";
import { Block, DescendingBlock, TetrisBlock, TetrisBlocks, TetrisBlocksType } from "../components/TetrisBlocks";
import GameGrids from "../components/GameGrids";
import GitHubLogo from "../assets/github.svg";

let tetrisPool: TetrisBlocksType[] = [];

// Generate random block types
const randomizeArray = (array: TetrisBlocksType[]): TetrisBlocksType[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const addBlock = () => {
  const tetriminos = Object.keys(TetrisBlocks) as TetrisBlocksType[];
  for (let i = 0; i < 3; i++) {
    tetrisPool.push(...tetriminos);
  }
  randomizeArray(tetrisPool);
};

const getRandomBlock = (): TetrisBlocksType => {
  if (tetrisPool.length === 0) {
    addBlock();
  }
  return tetrisPool.pop()!;
};

const randomRotation = (blocks: Block[]): Block[] => {
  for (let i = 0; i < 5; i++) {
    const rotateTypes = Math.floor(Math.random() * 3);
    switch (rotateTypes) {
      case 0:
        blocks = blocks.map((block) => ({ x: block.y, y: -block.x, z: block.z }));
        break;
      case 1:
        blocks = blocks.map((block) => ({ x: -block.z, y: block.y, z: block.x }));
        break;
      default:
        break;
    }
  }
  return blocks;
};

const getRandomPosition = (rotatedBlocks: Block[]): [number, number, number] => {
  const bounds = getBounds(rotatedBlocks);

  const xRange = 5 - (bounds.maxX - bounds.minX);
  const zRange = 5 - (bounds.maxZ - bounds.minZ);

  const x = Math.floor(Math.random() * xRange) - bounds.minX + 0.5;
  const y = 11.5 - bounds.maxY;
  const z = Math.floor(Math.random() * zRange) - bounds.minZ + 0.5;

  return [x, y, z];
};

const getBounds = (blocks: Block[]) => {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  blocks.forEach((block) => {
    minX = Math.min(minX, block.x);
    maxX = Math.max(maxX, block.x);
    minY = Math.min(minY, block.y);
    maxY = Math.max(maxY, block.y);
    minZ = Math.min(minZ, block.z);
    maxZ = Math.max(maxZ, block.z);
  });

  return { minX, maxX, minY, maxY, minZ, maxZ };
};

const Tetris: React.FC = () => {
  const [type, setType] = useState<TetrisBlocksType | null>(null);
  const [position, setPosition] = useState<[number, number, number] | null>(null);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [nextType, setNextType] = useState<TetrisBlocksType | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const fallIntervalRef = useRef<number | undefined>();

  const controlsRef = useRef<any>(null);

  const [gridState, setGridState] = useState<(string | null)[][][]>(() => {
    const initialState = [];
    for (let i = 0; i < 6; i++) {
      const xLayer = [];
      for (let j = 0; j < 6; j++) {
        const yLayer = new Array(12).fill(null);
        xLayer.push(yLayer);
      }
      initialState.push(xLayer);
    }
    return initialState;
  });

  const generateNewBlock = () => {
    if (gameOver) return;

    if (!nextType) return;
    setType(nextType);

    const newBlocks = randomRotation(TetrisBlocks[nextType].blocks);
    const newPosition = getRandomPosition(newBlocks);

    setBlocks(newBlocks);
    setPosition(newPosition);
    startDescend();

    const newNextType = getRandomBlock();
    setNextType(newNextType);
  };

  const startGame = () => {
    setGameStarted(true);

    const newType = getRandomBlock();
    const newBlocks = randomRotation(TetrisBlocks[newType].blocks);
    const newPosition = getRandomPosition(newBlocks);

    setType(newType);
    setBlocks(newBlocks);
    setPosition(newPosition);
    setNextType(getRandomBlock());

    setIsPaused(false);
  };

  const resetGame = () => {
    setType(null);
    setBlocks(null);
    setPosition(null);
    setNextType(null);
    setScore(0);

    setGridState((prevState) => {
      const newState = [...prevState];
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          newState[i][j].fill(null);
        }
      }
      return newState;
    });

    setIsPaused(false);
    setGameStarted(false);
    setGameOver(false);

    if (fallIntervalRef.current) {
      clearInterval(fallIntervalRef.current);
    }
  };

  const togglePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  const startDescend = () => {
    if (!position || !blocks || !type) return;

    if (isPaused || gameOver) return;

    if (fallIntervalRef.current) {
      clearInterval(fallIntervalRef.current);
    }

    fallIntervalRef.current = setInterval(() => {
      let [x, y, z] = position;
      let newY = y - 1;
      const predictedBlocksPosition = blocks.map((block) => ({ x: block.x + x, y: block.y + newY, z: block.z + z }));

      if (isValidPosition(predictedBlocksPosition)) {
        setPosition([x, newY, z]);
      } else {
        addBlockToGrid(
          blocks.map((block) => ({ x: block.x + x, y: block.y + y, z: block.z + z })),
          TetrisBlocks[type].color
        );
        generateNewBlock();
      }
    }, 1000) as unknown as number;
  };

  const isValidPosition = (newBlocks: Block[]) => {
    for (let { x, y, z } of newBlocks) {
      x = Math.floor(x);
      y = Math.floor(y);
      z = Math.floor(z);

      if (x < 0 || x >= 6 || z < 0 || z >= 6 || y < 0 || y >= 12 || gridState[x][z][y] !== null) {
        return false;
      }
    }

    return true;
  };

  const addBlockToGrid = (blocksPosition: Block[], color: string) => {
    const newGridState = [...gridState];

    for (let block of blocksPosition) {
      const x = Math.floor(block.x);
      const y = Math.floor(block.y);
      const z = Math.floor(block.z);
      newGridState[x][z][y] = color;
    }
    setGridState(newGridState);

    setScore((prevScore) => prevScore + 2);

    for (let y = 0; y < 12; y++) {
      if (isRowFull(y)) {
        clearRow(y);
      }
    }

    for (let x = 0; x < 6; x++) {
      for (let z = 0; z < 6; z++) {
        if (newGridState[x][z][11] !== null) {
          setGameOver(true);
          break;
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // 如果游戏暂停，不执行任何操作
    if (isPaused) return;

    if (!position || !blocks) return;

    let [x, y, z] = position;

    let newBlocks = blocks;

    const azimuthAngle = controlsRef.current?.getAzimuthalAngle() || 0;

    switch (e.key.toUpperCase()) {
      case "W":
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          z -= 1;
        } else {
          x -= 1;
        }
        break;
      case "S":
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          z += 1;
        } else {
          x += 1;
        }
        break;
      case "A":
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          x -= 1;
        } else {
          z += 1;
        }
        break;
      case "D":
        if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
          x += 1;
        } else {
          z -= 1;
        }
        break;
      // 沿x轴旋转
      case "X":
        newBlocks = blocks.map((block) => ({ x: block.x, y: block.z, z: -block.y }));
        break;
      // 沿y轴旋转
      case "Y":
        newBlocks = blocks.map((block) => ({ x: -block.z, y: block.y, z: block.x }));
        break;
      //沿z轴旋转
      case "Z":
        newBlocks = blocks.map((block) => ({ x: block.y, y: -block.x, z: block.z }));
        break;
      case " ":
        instantDescend();
        return;
      default:
        break;
    }

    const newBlocksPosition = newBlocks.map((block) => ({ x: block.x + x, y: block.y + y, z: block.z + z }));
    if (isValidPosition(newBlocksPosition)) {
      setPosition([x, y, z]);
      setBlocks(newBlocks);
      startFall();
    }
  };

  const instantDescend = () => {
    if (gameOver) return;

    if (!position || !blocks || !type) return;
    let [x, y, z] = position;

    while (true) {
      let newY = y - 1;
      const predictedBlocksPosition = blocks.map((block) => ({ x: block.x + x, y: block.y + newY, z: block.z + z }));
      if (!isValidPosition(predictedBlocksPosition)) {
        break;
      }
      y = newY;
    }

    addBlockToGrid(
      blocks.map((block) => ({ x: block.x + x, y: block.y + y, z: block.z + z })),
      TetrisBlocks[type].color
    );
    generateNewBlock();
  };

  return (
    <>
      <div className="game-header">
        <h1 className="title-3d">3D Tetris</h1>

        <div className="game-buttons-container"></div>
      </div>

      <div className="game-container">
        <div className="game-canvas-left">
          <Canvas style={{ width: "100%", height: "100%" }}>
            <ambientLight intensity={2} />
          </Canvas>
        </div>

        <div className="game-canvas-right">
          <Canvas style={{ width: "100%", height: "100%" }}>
            <ambientLight />

            <Html position={[-0.85, 0.15, 0]} className="instructions-label">
              <ul>
                <li>
                  <strong>Drag:</strong> <span>Mouse</span>
                </li>
                <li>
                  <strong>Rotate:</strong>
                  <ul>
                    <li>
                      <strong>X-axis:</strong> X
                    </li>
                    <li>
                      <strong>Y-axis:</strong> Y
                    </li>
                    <li>
                      <strong>Z-axis:</strong> Z
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Instant Drop:</strong> <span>Space</span>
                </li>
              </ul>
            </Html>
          </Canvas>
        </div>
      </div>
      <footer>
        <a href="https://github.com/adelansari/tris-3D" target="_blank" rel="noopener noreferrer">
          <img src={GitHubLogo} alt="github" className="github-logo" />
        </a>
      </footer>
    </>
  );
};

export default Tetris;
