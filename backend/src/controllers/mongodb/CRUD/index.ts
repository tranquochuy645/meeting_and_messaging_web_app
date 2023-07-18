// import { Db } from 'mongodb';
import { UsersController } from './CollectionOriented/users';
import { RoomsController } from './CollectionOriented/rooms';
import { MeetingsController } from './CollectionOriented/meetings';

// const CRUD = {
//   users: new UsersController,
//   rooms: new RoomsController,
//   meetings: new MeetingsController,
//   init: function (db: Db) {
//     this.users.ref = db.collection('users');
//     this.rooms.ref = db.collection('rooms');
//     this.meetings.ref = db.collection('meetings');
//   }
// };

// export default CRUD;
export { UsersController, RoomsController, MeetingsController }

