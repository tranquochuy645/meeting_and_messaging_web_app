import styles from './page.module.css'
import { getDb, connectToDb } from '../../lib/mongodb'
let db;
connectToDb(
  err => {
    if (err) {
      console.log(err);
    } else {
      db = getDb();
      console.log("Connected to database");
    }
  }
)
export default function Home() {
  return (
    <main>
      HI MOM
    </main>
  )
}
