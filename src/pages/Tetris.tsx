import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { CameraUpdater } from "../components/CameraUpdater";
import CoordinateAxes from "../components/CoordinateAxes";
import { Block, DescendingBlock, TetrisBlock, TetrisBlocks, TetrisBlocksType } from "../components/Tetrimino";
import TetrisBlocks from "../components/TetrisBlocks";
import GitHubLogo from "../assets/github.svg";

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
