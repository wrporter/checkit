package validate

import "reflect"

type fieldLevelMock struct {
	field interface{}
	param string
}

func (f fieldLevelMock) Top() reflect.Value {
	panic("implement me")
}

func (f fieldLevelMock) Parent() reflect.Value {
	panic("implement me")
}

func (f fieldLevelMock) Field() reflect.Value {
	return reflect.ValueOf(f.field)
}

func (f fieldLevelMock) FieldName() string {
	panic("implement me")
}

func (f fieldLevelMock) StructFieldName() string {
	panic("implement me")
}

func (f fieldLevelMock) Param() string {
	return f.param
}

func (f fieldLevelMock) GetTag() string {
	panic("implement me")
}

func (f fieldLevelMock) ExtractType(field reflect.Value) (value reflect.Value, kind reflect.Kind, nullable bool) {
	panic("implement me")
}

func (f fieldLevelMock) GetStructFieldOK() (reflect.Value, reflect.Kind, bool) {
	panic("implement me")
}

func (f fieldLevelMock) GetStructFieldOKAdvanced(val reflect.Value, namespace string) (reflect.Value, reflect.Kind, bool) {
	panic("implement me")
}

func (f fieldLevelMock) GetStructFieldOK2() (reflect.Value, reflect.Kind, bool, bool) {
	panic("implement me")
}

func (f fieldLevelMock) GetStructFieldOKAdvanced2(val reflect.Value, namespace string) (reflect.Value, reflect.Kind, bool, bool) {
	panic("implement me")
}
