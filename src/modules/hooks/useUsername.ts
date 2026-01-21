import { nanoid } from "nanoid";
import { useEffect, useState } from "react";



const ANIMALS = [
  "lion",
  "tiger",
  "bear",
  "eagle",
  "shark",
  "wolf",
  "fox",
  "owl",
  "panther",
  "leopard",
];

const generateRandomUsername = () => {
  const word = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

  return `anonymous-${word}-${nanoid(5)}`;
};

const STORAGE_KEY = "noira-username";

export const useUsername = ()=>{
  const [username, setUsername] = useState("");

  useEffect(() => {
      const main = () => {
        let storedUsername = localStorage.getItem(STORAGE_KEY);
  
        if (!storedUsername) {
          storedUsername = generateRandomUsername();
          localStorage.setItem(STORAGE_KEY, storedUsername);
        }
  
        setUsername(storedUsername);
      };
  
      main();
    }, []);

    return { username };



}