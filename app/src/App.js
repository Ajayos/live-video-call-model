import React from 'react';
import Login from './Login';
import Voice from "./Voice";

export default function App() {
  const [name, setName] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(false);
  const [userId, setUserId] = React.useState('')

  if (isLogin) return <Voice name={name}  userId={userId} />;
  else return <Login setName={setName} setIsLogin={setIsLogin} setUserId={setUserId}  />;
}
