import React from 'react'
import '../styles/Login.css'
import { bindActionCreators } from '@reduxjs/toolkit'
import { forgotPassword, login } from '../actions/login'
import { connect } from 'react-redux'
import LoginPage from '../components/LoginPage'

const Login = (props) => {
    const {actions} = props

    return (
        <LoginPage 
            actions={actions}
        />
    )
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(
        { 
            login,
            forgotPassword
        },
        dispatch
    ),
})

export default connect(null, mapDispatchToProps)(Login)
