import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import DataManagerContent from "./DataManagerContent";
import RequireAuth from "@/components/RequireAuth";
import ServiceContent from "./ServiceContent";
import ServiceDetail from "./services/ServiceDetail";


const AdminContent = () => (
    <div>
        <Switch>
            <Route path="/admin/services" exact={true}><RequireAuth><ServiceContent /></RequireAuth></Route>
            <Route path="/admin/services/:kind"><RequireAuth><ServiceDetail /></RequireAuth></Route>
            <Route path="/admin/data/manager"><RequireAuth><DataManagerContent /></RequireAuth></Route>
            <Route path="/admin/" render={() => <Redirect to="/admin/services" />} />
        </Switch>
    </div>
);

export default AdminContent;
