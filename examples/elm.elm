-- Source: https://github.com/sdras/night-owl-vscode-theme/blob/master/demo/elm.elm
main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
