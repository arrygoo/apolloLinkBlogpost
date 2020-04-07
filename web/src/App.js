import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { useQuery } from "@apollo/react-hooks";
import { USER_QUERY, PLANET_QUERY } from "./queries";
let a = 1;
const App = () => {
  const user = useQuery(USER_QUERY);
  const planet = useQuery(PLANET_QUERY);

  setTimeout(() => {
    if (planet.refetch && a === 1) {
      a = 2;
      planet.refetch();
    }
  }, 2000);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>{planet?.data?.planet?.name}</p>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;
