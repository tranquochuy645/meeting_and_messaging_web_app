import { Db } from 'mongodb';
import { users } from './users';
import { rooms } from './rooms';
import { meetings } from './meetings';
const Controller = {
  users: users,
  rooms: rooms,
  meetings: meetings,
};
export default Controller;
export const initilizeCRUDControllers = (db: Db) => {
  users.ref = db.collection('users');
  rooms.ref = db.collection('rooms');
  meetings.ref = db.collection('meetings');
}
export { users, rooms, meetings }
