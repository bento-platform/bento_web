import React from "react";
import {Redirect, Switch} from "react-router-dom";
import {BASE_PATH, withBasePath} from "../utils/url";

import OwnerRoute from "./OwnerRoute";
import ServiceContent from "./ServiceContent";
import DataManagerContent from "./DataManagerContent";
import ServiceDetail from "./services/ServiceDetail";


const AdminContent = React.memo(() => (
    <div>
        <Switch>
            <OwnerRoute path={withBasePath("admin/services")} exact={true} component={ServiceContent} />
            <OwnerRoute path={withBasePath("admin/services/:artifact")} component={ServiceDetail} />
            <OwnerRoute path={withBasePath("admin/data/manager")} component={DataManagerContent} />
            <Redirect from={BASE_PATH} to={withBasePath("admin/services")} />
        </Switch>
    </div>
));

export default AdminContent;
