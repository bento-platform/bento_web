import React from "react";
import {Redirect, Switch} from "react-router-dom";

import OwnerRoute from "./OwnerRoute";
import ServiceContent from "./ServiceContent";
import DataManagerContent from "./DataManagerContent";
import ServiceDetail from "./services/ServiceDetail";


const AdminContent = () => (
    <div>
        <Switch>
            <OwnerRoute path="/admin/services" exact={true} component={ServiceContent} />
            <OwnerRoute path="/admin/services/:artifact" component={ServiceDetail} />
            <OwnerRoute path="/admin/data/manager" component={DataManagerContent} />
            <Redirect from="/" to="/admin/services" />
        </Switch>
    </div>
);

export default AdminContent;
