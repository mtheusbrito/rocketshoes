import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { addToCartSuccess, updateAmount } from './actions';
import { formatPrice } from '../../../util/format';

function* addToCart({ id }) {
    // veridficando se o produto ja nao esta no carrinho
    const productExists = yield select(state =>
        state.cart.find(p => p.id === id)
    );
    // verificando estoque
    const stock = yield call(api.get, `/stock/${id}`);

    const stockAmount = stock.data.amount;
    const currentAmount = productExists ? productExists.amount : 0;

    const amount = currentAmount + 1;
    if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
    }
    if (productExists) {
        // const amount = productExists.amount + 1;
        yield put(updateAmount(id, amount));
    } else {
        const response = yield call(api.get, `/products/${id}`);
        const data = {
            ...response.data,
            amount: 1,
            priceFormatted: formatPrice(response.data.price),
        };
        yield put(addToCartSuccess(data));
    }
}

export default all([takeLatest('@cart/ADD_REQUEST', addToCart)]);
