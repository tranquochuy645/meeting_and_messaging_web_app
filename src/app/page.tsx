// import Image from 'next/image'
// import styles from './page.module.css'


import {getDb,connectToDb} from '../../lib/mongodb'
connectToDb(
  err=>{
    if(err){
      console.log(err);
    }else{
      let db=getDb();
      console.log(db);
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
