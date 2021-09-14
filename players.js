const players = [];
const curDrawer = [];

const getRoom = (room) => {
  let index = players.length;
  players.forEach((player, i) => {
    if (player[0] === room) {
      index = i;
    }
  });
  return { index };
};

const addPlayer = (id, name, room) => {
  const newPlayer = { id, name };
  const { index } = getRoom(room);
  const roomOfPlayer = players[index] || null;
  if (index === players.length) {
    curDrawer.push(1);
  }
  !roomOfPlayer
    ? players.push([room, newPlayer])
    : roomOfPlayer.push(newPlayer);
  return newPlayer;
};

const removePlayer = (id, room) => {
  const { index } = getRoom(room);
  const roomOfPlayer = players[index];
  const i = roomOfPlayer.findIndex(
    (player) => player !== room && player.id === id
  );
  if (i !== -1) {
    roomOfPlayer.splice(i, 1);
    if (i < curDrawer[index]) {
      curDrawer[index]--;
    }
    if (roomOfPlayer.length === 1) {
      players.splice(index, 1);
      curDrawer.splice(index, 1);
    }
  }
};

const isPlayer = (id, room) => {
  const { index } = getRoom(room);
  const roomOfPlayer = players[index];
  if (!roomOfPlayer) {
    return false;
  }
  const i = roomOfPlayer.findIndex(
    (player) => player !== room && player.id === id
  );

  if (i !== -1) {
    return true;
  }
  return false;
};

const numOfPlayers = (room) => {
  const { index } = getRoom(room);
  const roomOfPlayer = players[index];
  return roomOfPlayer.length - 1;
};

const getCurPlayer = (room) => {
  const { index } = getRoom(room);
  const roomOfPlayer = players[index];
  return roomOfPlayer[curDrawer[index]];
};

const setNextPlayer = (room) => {
  const { index } = getRoom(room);
  const roomOfPlayer = players[index];
  curDrawer[index]++;
  curDrawer[index] =
    (curDrawer[index] % roomOfPlayer.length) +
    Math.floor(curDrawer[index] / roomOfPlayer.length);
};

module.exports = {
  addPlayer,
  removePlayer,
  isPlayer,
  numOfPlayers,
  getCurPlayer,
  setNextPlayer,
};
