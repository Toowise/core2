import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import UserPanel from './UserPanel';
import LoginPage from './LoginPage';
import TrackingForm from './TrackingForm';
import ShipmentHistory from './ShipmentHistory';

const Role = () => {
  const [user, setUser] = useState(null);
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <LoginPage setUser={setUser} />
        </Route>
        {user ? (
          <>
            <Route path="/dashboard">
              <h1>Welcome, {user.username}</h1>
              {user.role === 'admin' ? <AdminPanel /> : <UserPanel />}
            </Route>

            <Route path="/track">
              <TrackingForm />
            </Route>

            <Route path="/shipment-history">
              <ShipmentHistory />
            </Route>

            <Redirect to="/dashboard" />
          </>
        ) : (
          <Redirect to="/login" />
        )}
      </Switch>
    </Router>
  );
};

export default Role;
