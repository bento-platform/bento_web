import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import OwnerRoute from "./OwnerRoute";
import ServiceContent from "./ServiceContent";
import DataManagerContent from "./DataManagerContent";
import ServiceDetail from "./services/ServiceDetail";


const AdminContent = () => (
    <div>
        <Switch>
            <OwnerRoute path="/admin/services" exact={true} component={ServiceContent} />
            <OwnerRoute path="/admin/services/:kind" component={ServiceDetail} />
            <OwnerRoute path="/admin/data/manager" component={DataManagerContent} />
            <Route path="/admin/" render={() => <Redirect to="/admin/services" />} />
        </Switch>
    </div>
);

export default AdminContent;
