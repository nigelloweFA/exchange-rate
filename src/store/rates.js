import { getExchangeRates } from "../api";

const initialState = {
    amount: "16.00",
    currencyCode: "JPY",
    currencyData: { USD: { displayLabel: "US Dollars", code: "USD", rate: 1.0 }},
    supportedCurrencies: ["USD", "EUR", "JPY", "CAD", "GBP", "MXN"],
}

export function ratesReducer(state = initialState, action) {
    switch (action.type) {
        case AMOUNT_CHANGED:
            return { ...state, amount: action.payload };
        case CURRENCY_CODE_CHANGED:
            return { ...state, currencyCode: action.payload };
        case "rates/labelReceived": {
            const { displayLabel, currencyCode } = action.payload;
            return {
                ...state,
                currencyData: {
                    ...state.currencyData,
                    [currencyCode]: {
                        ...state.currencyData[currencyCode],
                        displayLabel,
                    },
                },
            };
        }
        case "rates/ratesReceived": {
            const codes = Object.keys(action.payload).concat(state.currencyCode);
            const currencyData = {};
            for (let code in action.payload) {
                currencyData[code] = { code, rate: action.payload[code] };
            }
            return {
                ...state,
                currencyData,
                supportedCurrencies: codes,
            };
        }
        default:
            return state;
    }
}

// selectors
export const getAmount = (state) => state.rates.amount;
export const getCurrencyCode = (state) => state.rates.currencyCode;
export const getCurrencyData = (state) => state.rates.currencyData;
export const getSupportedCurrencies = (state) => state.rates.supportedCurrencies;
export const getDisplayLabel = (state, currencyCode) => {
    const match = state.rates.currencyData[currencyCode];
    if (match) return match.displayLabel;
}

// action types
export const AMOUNT_CHANGED = "rates/amountChanged"
export const CURRENCY_CODE_CHANGED = "rates/currencyCodeChanged"

// action creators
export const changeAmount = (amount) => ({
    type: AMOUNT_CHANGED,
    payload: amount
});

export function changeCurrencyCode(currencyCode) {
    return function changeCurrencyCodeThunk(dispatch, getState) {
        const state = getState();
        const supportedCurrencies = getSupportedCurrencies(state);
        dispatch({
            type: CURRENCY_CODE_CHANGED,
            payload: currencyCode,
        });
        getExchangeRates(currencyCode, supportedCurrencies).then(rates => {
            dispatch({
                type: "rates/ratesReceived",
                payload: rates,
            });
        })
    }
}

// thunks
export function getInitialRates(dispatch, getState) {
    const state = getState();
    const currencyCode = getCurrencyCode(state);
    dispatch(changeCurrencyCode(currencyCode));
}
