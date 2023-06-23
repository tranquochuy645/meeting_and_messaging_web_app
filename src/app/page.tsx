import styles from './page.module.css'
import { connectToDb } from '../lib/mongodb'
import LoginForm from './clientComponents/LoginForm';
// import {login,register} from '../../lib/auth'
connectToDb(
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to database");
    }
  }
)

export default function Home() {
  return (
    <main className={styles.className}>
      <LoginForm />
    </main>
  )
}
