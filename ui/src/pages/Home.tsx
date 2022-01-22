import React from 'react';
import Typography from '@mui/material/Typography';
import { Alert, Link, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import { useQuery } from 'react-query';
import { getItems, Item as ItemType, saveItem } from '../services/ItemService';
import Controls from '../components/Controls/Controls';
import Item from '../components/items/Item';
import useLocalStorage from '../hooks/useLocalStorage';

const useStyles = makeStyles((theme) => ({
    container: {
        padding: 32,
    },
    input: {
        marginTop: 12,
        marginBottom: 24,
    },
    controls: {
        position: 'fixed',
        '&.MuiSpeedDial-directionUp': {
            bottom: theme.spacing(4),
            right: theme.spacing(4),
        },
    },
}));

export default function Home() {
    const classes = useStyles();
    const [showCompleted, setShowCompleted] = useLocalStorage(
        'showCompleted',
        false
    );
    const [value, setValue] = React.useState('');
    const [saveError, setSaveError] = React.useState('');
    const [items, setItems] = React.useState<ItemType[]>([]);
    const { data, error, isLoading, refetch } = useQuery('items', getItems, {
        refetchOnMount: 'always',
    });

    React.useEffect(() => {
        if (data?.items) {
            setItems(data.items);
        }
    }, [data]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        setSaveError('');
        if (e.key === 'Enter' && value) {
            const item = { text: value };
            saveItem(item)
                .then((savedItem) => {
                    setItems([savedItem].concat(items));
                    setValue('');
                })
                .catch((err) => setSaveError(err.message));
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleShowCompletedChange = (value: boolean) => {
        setShowCompleted(value);
    };
    const handleDeleteCompleted = () => {
        const incompleteItems = items.filter((item) => !item.dateCompleted);
        setItems(incompleteItems);
    };
    const handleItemChange = (itemId: string, dateCompleted?: string) => {
        // TODO Clean this up. This logic of mutating a value within the items list is a hack.
        const item = items.find((item) => item.id === itemId);
        if (item) {
            item.dateCompleted = dateCompleted;
        }
        setItems(items);
    };

    return (
        <Box className={classes.container}>
            <Typography variant="h4">Get stuff done!</Typography>
            <TextField
                label="What do you want to do?"
                fullWidth
                inputProps={{
                    onKeyDown: handleKeyDown,
                    'data-testid': 'Home.AddItemTextBox',
                }}
                value={value}
                onChange={handleChange}
                className={classes.input}
            />

            {saveError && (
                <Alert severity="error">
                    Failed to save item. Please try again.
                </Alert>
            )}

            {isLoading && <CircularProgress />}
            {error && (
                <Alert severity="error">
                    Failed to load items.{' '}
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link component="button" onClick={() => refetch()}>
                        Try again.
                    </Link>
                </Alert>
            )}
            {items && (
                <List>
                    {items.map((item) => (
                        <Item
                            key={item.id}
                            id={item.id}
                            text={item.text}
                            dateCompleted={item.dateCompleted}
                            showCompleted={showCompleted}
                            onChange={handleItemChange}
                        />
                    ))}
                </List>
            )}

            <Controls
                className={classes.controls}
                showCompleted={showCompleted}
                onShowCompletedChange={handleShowCompletedChange}
                onDeleteCompleted={handleDeleteCompleted}
            />
        </Box>
    );
}
