import React from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { deleteCompletedItems } from '../items/ItemService';
import { Snackbar } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
    tooltip: {
        whiteSpace: 'nowrap',
        backgroundColor: 'rgba(97, 97, 97, 0.9)',
        color: '#ffffff',
    },
}));

interface ControlsProps {
    className?: string,
    showCompleted: boolean,
    onShowCompletedChange: (showCompleted: boolean) => void,
    onDeleteCompleted: () => void,
}

export default function Controls({
    className,
    showCompleted,
    onShowCompletedChange,
    onDeleteCompleted,
}: ControlsProps) {
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
        deleteCompletedItems().then(response => {
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
