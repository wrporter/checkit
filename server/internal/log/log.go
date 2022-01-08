package log

import (
	"context"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type loggerKeyType string

const loggerKey loggerKeyType = "log.logger"

var logger *zap.Logger

// MustInit configures a logger with default production settings and panics if
// there is an error.
func MustInit() {
	config := zap.NewProductionConfig()
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	var err error
	logger, err = config.Build()
	if err != nil {
		panic(err)
	}
}

// NewContext sets the given fields on the logger context. Use for adding
// information to logs, such as request transaction identifiers.
func NewContext(ctx context.Context, fields ...zapcore.Field) context.Context {
	return context.WithValue(ctx, loggerKey, LC(ctx).With(fields...))
}

// L returns the regular logger.
func L() *zap.Logger {
	return logger
}

// S returns the sugared logger.
func S() *zap.SugaredLogger {
	return logger.Sugar()
}

// LC returns the logger associated with the given context.
func LC(ctx context.Context) *zap.Logger {
	if ctx == nil {
		return logger
	}
	if ctxLogger, ok := ctx.Value(loggerKey).(*zap.Logger); ok {
		return ctxLogger
	}
	return logger
}

// SC returns the logger associated with the given context.
func SC(ctx context.Context) *zap.SugaredLogger {
	if ctx == nil {
		return logger.Sugar()
	}
	if ctxLogger, ok := ctx.Value(loggerKey).(*zap.Logger); ok {
		return ctxLogger.Sugar()
	}
	return logger.Sugar()
}
