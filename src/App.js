import React, { useState, useEffect } from "react";
import "./panda.css";
import { motion } from "framer-motion";

const maxLife = 10;
const moveSpeed = 40;

function Panda({ position, pose, damage }) {
  const leftFistStyle =
    pose === "block"
      ? { scale: 1.2, x: 30 }
      : ["idle", "rightPunch"].includes(pose)
      ? { scale: 1, x: 0 }
      : { scale: 3, x: 0 };
  const rightFistStyle =
    pose === "block"
      ? { scale: 1.2, x: -30 }
      : ["idle", "leftPunch"].includes(pose)
      ? { scale: 1, x: 0 }
      : { scale: 3, x: 0 };
  const fistStyle = {
    display: "inline-block",
    fontSize: 40,
  };
  return (
    <motion.span
      className="panda"
      role="img"
      aria-label="panda"
      animate={{ x: position * moveSpeed, rotate: 5 * damage }}
      // transition={{ duration: 0.05 }}
      // style={{
      //   transform: `translateX(${position * 20}px)`
      // }}
    >
      <motion.span
        animate={leftFistStyle}
        role="img"
        aria-label="fist"
        style={fistStyle}
      >
        👊
      </motion.span>
      🐼
      <motion.span
        animate={rightFistStyle}
        role="img"
        aria-label="fist"
        style={{
          ...fistStyle,
          scaleX: -1,
        }}
      >
        👊
      </motion.span>
    </motion.span>
  );
}

function Gamer({ position, pose, onLeftFistClick, onRightFistClick }) {
  const fistStyle = {
    display: "inline-block",
    fontSize: 80,
    opacity: 0.3,
  };
  const leftFistAnimate =
    pose === "block"
      ? {
          rotateY: 0,
          y: 0,
          x: 10,
          scale: 1,
        }
      : ["idle", "rightPunch"].includes(pose)
      ? { x: 0, y: 0, scale: 1, rotateY: 30 }
      : { x: 0, y: -60, scale: 0.6, rotateY: 30 };
  const rightFistAnimate =
    pose === "block"
      ? {
          rotateY: 0,
          y: 0,
          x: -10,
          scale: 1,
        }
      : ["idle", "leftPunch"].includes(pose)
      ? { x: 0, y: 0, scale: 1, rotateY: 30 }
      : { x: 0, y: -60, scale: 0.6, rotateY: 30 };

  return (
    <motion.div animate={{ x: position * moveSpeed }}>
      <motion.span
        style={{
          ...fistStyle,
          rotate: 90,
          scaleX: -1,
        }}
        animate={leftFistAnimate}
        role="img"
        aria-label="fist"
        onClick={onLeftFistClick}
      >
        🤛🏾
      </motion.span>
      <motion.span
        style={{
          ...fistStyle,
          rotate: 90,
        }}
        animate={rightFistAnimate}
        role="img"
        aria-label="fist"
        onClick={onRightFistClick}
      >
        🤛🏾
      </motion.span>
    </motion.div>
  );
}

function LifeBar({ life }) {
  const lifeColor = life < maxLife * 0.3 ? "red" : "green";
  return (
    <div
      style={{
        border: `1px solid ${lifeColor}`,
        width: 250,
        height: 30,
        borderRadius: 5,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.floor((life / maxLife) * 100)}%`,
          backgroundColor: lifeColor,
        }}
      />
    </div>
  );
}

/*
 block: -1
 other poses: -5
*/

const poses = ["block", "leftPunch", "rightPunch", "bothPunch"];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const clampPosition = p => clamp(p, -5, 5);

function getNextMove({ myStatus, enemyStatus }) {
  return {
    position: clampPosition(
      myStatus.position + Math.floor(2 - Math.random() * 3)
    ),
    pose:
      myStatus.pose === "idle"
        ? poses[Math.floor(Math.random() * poses.length)]
        : "idle",
  };
}

function Game() {
  const [gamerPosition, setGamerPosition] = useState(0);
  const [gamerPose, setGamerPose] = useState("idle");
  const [pandaStatus, setPandaStatus] = useState({ position: 0, pose: "idle" });
  const [pandaLife, setPandaLife] = useState(maxLife);
  const [gamerLife, setGamerLife] = useState(maxLife);

  function setPose(setPoseFun, pose) {
    setPoseFun(pose);
    setTimeout(() => {
      setPoseFun("idle");
    }, 300);
  }

  useEffect(() => {
    const tm = setTimeout(() => {
      setPandaStatus(s =>
        getNextMove({
          myStatus: { ...s, life: pandaLife },
          enemyStatus: {
            position: gamerPosition,
            pose: gamerPose,
            life: gamerLife,
          },
        })
      );
    }, 300);
    return () => clearTimeout(tm);
  }, [pandaStatus, gamerPosition, gamerPose, pandaLife, gamerLife]);

  function getDamage(myPosition, enemyPosition, enemyPose) {
    return ["leftPunch", "rightPunch", "bothPunch"].includes(enemyPose) &&
      Math.abs(myPosition - enemyPosition) <= 2
      ? 2
      : 0;
  }

  const gamerDamage = getDamage(
    gamerPosition,
    pandaStatus.position,
    pandaStatus.pose
  );

  const pandaDamage = getDamage(pandaStatus.position, gamerPosition, gamerPose);

  // update life
  useEffect(() => {
    setGamerLife(l => l - gamerDamage);
    setPandaLife(l => l - pandaDamage);
    // const tm = setTimeout(() => {
    //   setGamerLife(l => l - gamerDamage)
    //   setPandaLife(l => l - pandaDamage)
    // }, 300)
    // return () => clearTimeout(tm)
  }, [gamerDamage, setPandaLife, pandaDamage, setGamerLife]);

  return (
    <motion.div
      className="App"
      animate={{ rotate: gamerDamage > 0 ? 5 : 0 }}
      tabIndex={0}
      onKeyDown={function(event) {
        switch (event.key) {
          case "ArrowLeft":
            setGamerPosition(p => p - 1);
            break;
          case "ArrowRight":
            setGamerPosition(p => p + 1);
            break;
          case "a":
            setPose(setGamerPose, "leftPunch");
            break;
          case "s":
            setPose(setGamerPose, "bothPunch");
            break;
          case "d":
            setPose(setGamerPose, "rightPunch");
            break;
          case "f":
            setPose(setGamerPose, "block");
            break;
        }
      }}
    >
      <LifeBar life={pandaLife} />
      <Panda
        position={pandaStatus.position}
        pose={pandaStatus.pose}
        damage={pandaDamage}
      />
      <Gamer
        position={gamerPosition}
        pose={gamerPose}
        onLeftFistClick={function() {
          setPose(setGamerPose, "leftPunch");
        }}
        onRightFistClick={function() {
          setPose(setGamerPose, "rightPunch");
        }}
      />
      <LifeBar life={gamerLife} />
      💥
    </motion.div>
  );
}

export default function App() {
  return (
    <>
      <Game />
    </>
  );
}
