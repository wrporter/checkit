import React from 'react';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SettingsIcon from '@material-ui/icons/Settings';
import CloseIcon from '@material-ui/icons/Close';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import * as itemService from '../items/ItemService';
import { Snackbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    tooltip: {
        whiteSpace: 'nowrap',
        backgroundColor: 'rgba(97, 97, 97, 0.9)',
        color: '#ffffff',
    },
}));

export default function Controls({
    className,
    showCompleted,
    onShowCompletedChange,
    onDeleteCompleted,
}) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState('');

    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };

    // TODO Persist user preference for showing completed items
    const handleShowCompletedClick = () => {
        handleClose();
        onShowCompletedChange(!showCompleted);
    };

    const handleDeleteCompletedItems = () => {
        handleClose();
        itemService.deleteCompletedItems().then(response => {
            if (response.status >= 400) {
                setDeleteError(
                    'Failed to delete completed items. Please try again.'
                );
            } else {
                onDeleteCompleted();
            }
        });
    };

    const handleDeleteErrorClose = () => {
        setDeleteError('');
    };

    function getShowTitle() {
        return showCompleted ? 'Hide Completed Items' : 'Show Completed Items';
    }

    return (
        <>
            <SpeedDial
                data-testid="Home.Controls"
                className={className}
                icon={
                    <SpeedDialIcon
                        icon={<SettingsIcon />}
                        openIcon={<CloseIcon />}
                    />
                }
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                direction="up"
                ariaLabel="Controls"
            >
                <SpeedDialAction
                    data-testid="Home.Controls.Delete"
                    icon={<DeleteSweepIcon />}
                    title="Delete Completed Items"
                    tooltipTitle="Delete Completed Items"
                    onClick={handleDeleteCompletedItems}
                    tooltipOpen={true}
                    classes={{ staticTooltipLabel: classes.tooltip }}
                />
                <SpeedDialAction
                    data-testid="Home.Controls.ShowHide"
                    data-showcompleted={showCompleted}
                    icon={
                        showCompleted ? (
                            <VisibilityIcon />
                        ) : (
                            <VisibilityOffIcon />
                        )
                    }
                    title={getShowTitle()}
                    tooltipTitle={getShowTitle()}
                    onClick={handleShowCompletedClick}
                    tooltipOpen={true}
                    classes={{ staticTooltipLabel: classes.tooltip }}
                />
            </SpeedDial>

            <Snackbar
                open={!!deleteError}
                message={deleteError}
                autoHideDuration={5000}
                onClose={handleDeleteErrorClose}
            />
        </>
    );
}
