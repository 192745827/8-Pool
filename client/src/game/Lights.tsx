import React from 'react';
import useSettingsStore from '../store/useSettingsStore';

export const Lights: React.FC = () => {
  const shadowQuality = useSettingsStore((state) => state.settings.shadowQuality);

  const castShadows = shadowQuality !== 'low';
  const shadowMapSize = shadowQuality === 'high' ? 2048 : 1024;

  return (
    <>
      {/* Dim room ambiance to make the table pop */}
      <ambientLight intensity={0.3} />

      {/* 3-Bulb Tournament Overhead Spotlights casting soft overlapping shadows */}
      {castShadows ? (
        <>
          {/* Left Lamp */}
          <spotLight
            castShadow={true}
            position={[-3.6, 5.0, 0]}
            intensity={2.8}
            angle={Math.PI / 3}
            penumbra={1.0}
            distance={12}
            decay={1.2}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-bias={-0.00005}
            shadow-normalBias={0.001} // Snaps shadows to bottom of ball, preventing floating
            shadow-camera-far={10}
          />
          {/* Center Lamp */}
          <spotLight
            castShadow={true}
            position={[0, 5.0, 0]}
            intensity={3.2}
            angle={Math.PI / 2.8}
            penumbra={1.0}
            distance={12}
            decay={1.2}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-bias={-0.00005}
            shadow-normalBias={0.001}
            shadow-camera-far={10}
          />
          {/* Right Lamp */}
          <spotLight
            castShadow={true}
            position={[3.6, 5.0, 0]}
            intensity={2.8}
            angle={Math.PI / 3}
            penumbra={1.0}
            distance={12}
            decay={1.2}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-bias={-0.00005}
            shadow-normalBias={0.001}
            shadow-camera-far={10}
          />
        </>
      ) : (
        // Efficient directional light fallback for low graphics/shadow settings
        <directionalLight 
          position={[0, 6, 0]} 
          intensity={3.0} 
        />
      )}

      {/* Soft color-bounced fill point lights from sides representing room ambiance */}
      <pointLight position={[-6, 4, -3]} intensity={0.25} color="#e0f2fe" />
      <pointLight position={[6, 4, 3]} intensity={0.25} color="#ffedd5" />
    </>
  );
};

export default Lights;
