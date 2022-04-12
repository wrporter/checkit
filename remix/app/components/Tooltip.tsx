import React from 'react';
import classNames from 'classnames';
import type { TooltipProps as ReachTooltipProps } from '@reach/tooltip';
import { Tooltip as ReachTooltip } from '@reach/tooltip';

interface TooltipProps extends ReachTooltipProps {
    className?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
    ({ className, ...rest }: TooltipProps, ref) => {
        return (
            <ReachTooltip
                ref={ref}
                className={classNames(className)}
                {...rest}
            />
        );
    }
);

export default Tooltip;
