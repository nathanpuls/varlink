
// Fix: Use standard modular import for Firebase 9+
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  update, 
  remove, 
  onValue, 
  get 
} from 'firebase/database';
import { NewVarLink } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDFP5GAwTNqLyaySh_t_2j8NFiulHTeFy8",
  authDomain: "fwdng-1d5f9.firebaseapp.com",
  databaseURL: "https://fwdng-1d5f9.firebaseio.com",
  projectId: "fwdng-1d5f9",
  storageBucket: "fwdng-1d5f9.firebasestorage.app",
  messagingSenderId: "250477002363",
  appId: "1:250477002363:web:95a89409c8d5991a9aacde"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const linksRef = ref(db, 'VARLINKS');

export const saveLink = async (link: NewVarLink, id?: string) => {
  if (id) {
    const linkRef = ref(db, `VARLINKS/${id}`);
    return update(linkRef, link);
  } else {
    const snapshot = await get(linksRef);
    const data = snapshot.val();
    let maxOrder = 0;
    
    if (data) {
      const items = Object.values(data);
      if (items.length > 0) {
        maxOrder = Math.max(...items.map((item: any) => item.order || 0));
      }
    }
    
    const newRef = push(linksRef);
    return set(newRef, { 
      ...link, 
      createdAt: Date.now(),
      order: maxOrder + 1
    });
  }
};

export const updateLinkOrder = (id: string, newOrder: number) => {
  const linkRef = ref(db, `VARLINKS/${id}`);
  return update(linkRef, { order: newOrder });
};

export const deleteLink = async (id: string) => {
  const linkRef = ref(db, `VARLINKS/${id}`);
  try {
    await remove(linkRef);
    return true;
  } catch (error) {
    console.error("Error deleting link:", error);
    return false;
  }
};

export { db, onValue };