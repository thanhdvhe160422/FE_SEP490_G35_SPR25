import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SnackbarProvider } from "notistack";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <SnackbarProvider anchorOrigin={{vertical:'top', horizontal:'right'}}>
      <App />
    </SnackbarProvider>
  </BrowserRouter>
);
