import React from 'react';

const StatusConvert = ({ status }) => {
    let statusText;
    switch (status) {
        case 0:
            statusText = ' בהמתנה';
            break;
        case 1:
            statusText = ' בהכנה';
            break;
        case 2:
            statusText = ' מוכן';
            break;
        case 3:
            statusText = ' סוים';
            break;
        default:
            statusText = 'סטטוס לא ידוע';
    }

    return <span>{statusText}</span>;
};

export default StatusConvert;
