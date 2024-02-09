import { useFrame, useThree } from "react-three-fiber";
import { Vector3 } from "three";

interface CameraUpdaterProps {
  setDirection: (dir: Vector3) => void;
}

export const CameraUpdater: React.FC<CameraUpdaterProps> = ({ setDirection }) => {
  const { camera } = useThree();

  useFrame(() => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    setDirection(direction);
  });

  return null;
};
