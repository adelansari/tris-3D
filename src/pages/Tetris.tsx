import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { CameraUpdater } from "../components/CameraUpdater";
import CoordinateAxes from "../components/CoordinateAxes";
import { Block, DescendingBlock, TetrisBlock, TetrisBlocks, TetrisBlocksType } from "../components/Tetrimino";
import TetrisBlocks from "../components/TetrisBlocks";
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
  return (
    <>
      <div className="game-header">
        <a href="https://github.com/adelansari/tris-3D" target="_blank" rel="noopener noreferrer">
          <img src={GitHubLogo} alt="github" className="github-logo" />
        </a>

        <h1 className="title-3d">3D &nbsp;Tetris</h1>

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
    </>
  );
};

export default Tetris;
