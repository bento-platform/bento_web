import React from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";

import { Button, Divider, Drawer } from "antd";

import NotificationList from "./NotificationList";

import { hideNotificationDrawer } from "../../modules/notifications/actions";
import { withBasePath } from "../../utils/url";
import { notificationPropTypesShape } from "../../propTypes";

const NotificationDrawer = ({
    notificationDrawerVisible,
    notifications,
    hideNotificationDrawer,
}) => {
    const history = useHistory();

    const seeAllNotifications = () => {
        hideNotificationDrawer();
        history.push(withBasePath("notifications"));
    };

    return (
        <Drawer
            title={"Notifications"}
            visible={notificationDrawerVisible}
            width="auto"
            onClose={() => hideNotificationDrawer()}
        >
            <NotificationList
                small={true}
                notifications={notifications.filter((n) => !n.read)}
            />
            <Divider />
            <Button
                type="link"
                style={{ width: "100%" }}
                onClick={seeAllNotifications}
            >
                See Read Notifications
            </Button>
        </Drawer>
    );
};

NotificationDrawer.propTypes = {
    notificationDrawerVisible: PropTypes.bool,
    notifications: PropTypes.arrayOf(notificationPropTypesShape),

    hideNotificationDrawer: PropTypes.func,
};

const mapStateToProps = (state) => ({
    notificationDrawerVisible: state.notifications.drawerVisible,
    notifications: state.notifications.items,
});

export default connect(mapStateToProps, { hideNotificationDrawer })(
    NotificationDrawer
);
