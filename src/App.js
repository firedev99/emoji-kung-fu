import React, { useState, useEffect } from "react";
import "./panda.css";
import { motion, AnimatePresence } from "framer-motion";

const maxLife = 20;
const moveSpeed = 40;

function Puncher({ face, position, pose, damage, fistImpact }) {
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
    position: "relative",
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
        <AnimatePresence>
          {["both", "left"].includes(fistImpact) && (
            <motion.span
              style={{ position: "absolute", left: 0, top: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: [1, 0] }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              💥
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
      {face}
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
        <AnimatePresence>
          {["both", "right"].includes(fistImpact) && (
            <motion.span
              style={{ position: "absolute", left: 0, top: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: [1, 0] }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              💥
            </motion.span>
          )}
        </AnimatePresence>
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
        height: 10,
        borderRadius: 5,
      }}
    >
      <motion.div
        animate={{ width: `${Math.floor((life / maxLife) * 100)}%` }}
        style={{
          height: "100%",
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

const clampPosition = (p) => clamp(p, -5, 5);

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

function Game({ puncher }) {
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
    if (pandaLife === 0 || gamerLife === 0) return;
    const tm = setTimeout(() => {
      setPandaStatus((s) =>
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

  function getDamage({ myStatus, enemyStatus }) {
    function oneFistDamage(offset) {
      const distance = Math.abs(offset);
      const blockedDamage = (d) => d;
      // Math.max(0, d - myStatus.pose === "block" ? 1 : 0);
      switch (distance) {
        case 0:
          return blockedDamage(4);
        case 1:
          return blockedDamage(2);
        case 2:
          return blockedDamage(1);
        default:
          return 0;
      }
    }

    const leftFistDamage = ["leftPunch", "bothPunch"].includes(enemyStatus.pose)
      ? oneFistDamage(enemyStatus.position - 1 - myStatus.position)
      : 0;
    const rightFistDamage = ["rightPunch", "bothPunch"].includes(
      enemyStatus.pose
    )
      ? oneFistDamage(enemyStatus.position + 1 - myStatus.position)
      : 0;
    return [
      leftFistDamage + rightFistDamage,
      leftFistDamage > 0 && rightFistDamage > 0
        ? "both"
        : leftFistDamage > 0
        ? "left"
        : rightFistDamage > 0
        ? "right"
        : "none",
    ];
  }

  const [gamerDamage, pandaFistImpact] = getDamage({
    myStatus: {
      position: gamerPosition,
      pose: gamerPosition,
    },
    enemyStatus: pandaStatus,
  });

  const [pandaDamage, gamerFistImpact] = getDamage({
    myStatus: pandaStatus,
    enemyStatus: {
      position: gamerPosition,
      pose: gamerPose,
    },
  });

  // update life
  useEffect(() => {
    setGamerLife((l) => Math.max(0, l - gamerDamage));
    setPandaLife((l) => Math.max(0, l - pandaDamage));
    // const tm = setTimeout(() => {
    //   setGamerLife(l => l - gamerDamage)
    //   setPandaLife(l => l - pandaDamage)
    // }, 300)
    // return () => clearTimeout(tm)
  }, [gamerDamage, setPandaLife, pandaDamage, setGamerLife]);

  useEffect(() => {
    if (pandaLife === 0 || gamerLife === 0) return;
    const handleKeyDown = function (event) {
      switch (event.key) {
        case "ArrowLeft":
          setGamerPosition((p) => p - 1);
          break;
        case "ArrowRight":
          setGamerPosition((p) => p + 1);
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gamerLife, pandaLife]);

  const controlButtonStyle = {
    borderRadius: 8,
    // border: "2px solid orange",
    backgroundColor: "#ffeedd",
    fontSize: 40,
    padding: 8,
    margin: 8,
    width: 48,
    height: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          flex: 1,
        }}
        animate={{ rotate: gamerDamage > 0 ? 5 : 0 }}
      >
        <LifeBar life={pandaLife} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Puncher
            face={(function getFace() {
              const face = (faces, life) =>
                faces[Math.floor((1 - life / maxLife) * (faces.length - 1))];
              return pandaLife > gamerLife
                ? face(puncher.winningFaces, gamerLife)
                : face(puncher.losingFaces, pandaLife);
            })()}
            position={pandaStatus.position}
            pose={pandaStatus.pose}
            damage={pandaDamage}
            fistImpact={pandaFistImpact}
          />
          <Gamer
            position={gamerPosition}
            fistImpact={gamerFistImpact}
            pose={gamerPose}
            onLeftFistClick={function () {
              setPose(setGamerPose, "leftPunch");
            }}
            onRightFistClick={function () {
              setPose(setGamerPose, "rightPunch");
            }}
          />
        </div>
        <LifeBar life={gamerLife} />
        <AnimatePresence>
          {(pandaLife === 0 || gamerLife === 0) && (
            <motion.div
              style={{
                position: "absolute",
                fontSize: 90,
                textShadow: "0px 0px 10px #ee8abb",
                top: 200,
                color: "red",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
            >
              <div>K.O.</div>
              <div
                style={{
                  fontSize: 50,
                  color: pandaLife === 0 ? "green" : "red",
                }}
              >
                {pandaLife === 0 ? "YOU WIN" : "YOU LOSE"}
              </div>
              {/* <button
                onClick={function() {
                  setPandaLife(maxLife);
                  setGamerLife(maxLife);
                }}
              >
                Fight Again
              </button> */}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function createPuncherFaces(initialFace) {
  const mark = (sym, style) => (
    <span style={{ position: "absolute", fontSize: 20, ...style }}>{sym}</span>
  );

  return {
    losingFaces: [
      initialFace,
      <span style={{ position: "relative" }}>
        {initialFace}
        {mark("💢", { left: 10, top: 20 })}
      </span>,
      <span style={{ position: "relative" }}>
        {initialFace}
        {mark("❗️", { left: 10, top: 50 })}
        {mark("❗️", { left: 50, top: 50 })}
      </span>,
      <span style={{ position: "relative" }}>
        {initialFace}
        {mark("❌", { left: 10, top: 35 })}
        {mark("❌", { left: 50, top: 35 })}
      </span>,
    ],
    winningFaces: [initialFace],
  };
}

function PuncherChooser({ onPuncherChange }) {
  const [uploadImageDataUrl, setUploadImageDataUrl] = useState(null);
  const punchers = ["🐼", "🐵", "🤨", "🐯", "🐷"].map((p) =>
    p === "🤨"
      ? {
          id: p,
          losingFaces: ["🤨", "🤪", "😤", "😭", "😵"],
          winningFaces: ["🤨", "🥴", "😆", "🤣", "🥳"],
        }
      : { id: p, ...createPuncherFaces(p) }
  );
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    puncher: { fontSize: 80, cursor: "pointer", margin: 10 },
    uploaderText: { fontSize: 20 },
  };
  const uploader = (
    <div>
      <h2>Or upload your own enemy:</h2>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          console.log(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            console.log(event);
            setUploadImageDataUrl(event.target.result);
          };
          reader.readAsDataURL(file);
        }}
      />
      {uploadImageDataUrl && (
        <>
          <div>
            <img src={uploadImageDataUrl} width={70} />
          </div>
          <button
            style={styles.uploaderText}
            onClick={() =>
              typeof onPuncherChange &&
              onPuncherChange(
                createPuncherFaces(<img src={uploadImageDataUrl} width={70} />)
              )
            }
          >
            Go punch
          </button>
        </>
      )}
    </div>
  );
  return (
    <div style={styles.container}>
      <h1>Choose Your Opponent</h1>
      <div style={{ display: "flex" }}>
        {punchers.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.4 }}
            style={styles.puncher}
            onClick={() =>
              typeof onPuncherChange === "function" && onPuncherChange(p)
            }
          >
            {p.id}
          </motion.div>
        ))}
        {/* <motion.div style={styles.puncher} whileHover={{ scale: 1.4 }}>
          📲
        </motion.div> */}
      </div>
      {uploader}
    </div>
  );
}

function PuncherStorybook() {
  const { losingFaces, winningFaces } = createPuncherFaces("🐼");
  const allFaces = (faces) =>
    Array(faces.length)
      .fill(0)
      .map((_, idx) => (
        <>
          <Puncher face={faces[idx]} pose="idle" />
          <div style={{ margin: 10 }} />
        </>
      ));
  const containerStyle = { display: "flex" };
  return (
    <div>
      <div style={containerStyle}>{allFaces(losingFaces)}</div>
      <div style={containerStyle}>{allFaces(winningFaces)}</div>
    </div>
  );
}

export default function App() {
  const [puncher, setPuncher] = useState({ damage0: "🐼" });
  const [activeUI, setActiveUI] = useState("puncher-chooser"); //"face-debug");
  return (
    <div
      style={{
        height: "100vh",
        maxHeight: 800,
        padding: 32,
        margin: 0,
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {activeUI === "face-debug" ? (
        <PuncherStorybook />
      ) : activeUI === "puncher-chooser" ? (
        <PuncherChooser
          onPuncherChange={(p) => {
            setPuncher(p);
            setActiveUI("game");
          }}
        />
      ) : (
        <Game puncher={puncher} />
      )}
    </div>
  );
}
