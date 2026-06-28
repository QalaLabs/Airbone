'use client'
import { useState, useMemo, useCallback } from 'react'

export default function useFormValidation(initialValues, validators) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (touched[name] && validators[name]) {
      const result = validators[name](value)
      setErrors(prev => ({ ...prev, [name]: result.error }))
    }
  }, [touched, validators])

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    if (validators[name]) {
      const result = validators[name](values[name])
      setErrors(prev => ({ ...prev, [name]: result.error }))
    }
  }, [validators, values])

  const validate = useCallback(() => {
    const newErrors = {}
    let valid = true
    for (const [name, validator] of Object.entries(validators)) {
      const result = validator(values[name])
      if (!result.valid) {
        newErrors[name] = result.error
        valid = false
      }
    }
    setErrors(newErrors)
    setTouched(Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    return valid
  }, [validators, values])

  const isValid = useMemo(() => {
    for (const [name, validator] of Object.entries(validators)) {
      const result = validator(values[name])
      if (!result.valid) return false
    }
    return true
  }, [values, validators])

  const reset = useCallback((newValues) => {
    setValues(newValues || initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    error: touched[name] ? errors[name] : null,
    onChange: (val) => handleChange(name, val),
    onBlur: () => handleBlur(name),
  }), [values, errors, touched, handleChange, handleBlur])

  return { values, errors, touched, handleChange, handleBlur, validate, isValid, reset, setValues, getFieldProps }
}
