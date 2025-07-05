export const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAoJJREFUWEfFl4lu4zAMRO3cx/9/au6reMaOdkxTTl0grQFCRoqaT+SQotq2bV9N8rRt28xms87m83l553eZ/9vr9Wpkz+ezkT0ej+6dv1X81AFw7M4FBACPVn2c1Z3zLgDeJwHgeLFYdAARYioAEAKJEG2WAjl3gCwNYymQQ9b7/V4spmIAwO6Wy2VnAMikBWlDURBELf8CuN1uHQSrPwMAHK5WqwFELQ01AIXdAa7XawfAb3p6AOwK5+v1ugAoEq4FRSFLgavfQ49jAGQpAE5wjgGCeRrGdBArwHOPcwFcLpcGU1X0IsBuN5tNgYhaiFFwHTiAwq8I+O5xfj6fOz38K+X/fYAdb7fbAgFAjIJ6Aav3AYlQ6nfnDoDz0+lUxNiLALvf7XaDNGQ6GANQBKR85V27B4D3QQRw7hGIYlQKWGM79hSweyCUe1blXhEAogfABwHAXAcqSYkxCtHLUK3XBajSc4Dj8dilAeiSAgD2+30BAEKV4GKcAuDqB4TdYwBgPQByCgApUBoE4EJUGvxUjF3Q69/zLw3g/HA45ABKgdIQu+JPIyDnisCfAxAFNFM0EFNQ64gfS0EUoQP8ighrZSjn3oziZEQpauyKbfjbZchHUL/3AS/Dd30gAkxuRACgfO+EWQW8qwI1o+wseNuKcQiESjALvwNoMI0TcRzD4lFcPYwIM+JTF5x6HOs8yI7jeB5oKhpMRFH9UwaSCDB2Jmg4rc6E2TT0biIaG0rQhNqyhpHBcayTTSXH6vcDL7/sdqRK8LkwTsU499E8vRcAojHcZ4AxABdilgrp4lsXk8oVqgwh7+6H3phqd8J0Kk4vbx/+sZqCD/vNLya/5dT9fAH8g1WdNGgwbQAAAABJRU5ErkJggg==';

// credit package definition (price in cents)
export const CREDIT_PACKAGES = [
  {
    id: 'basic',
    credits: 100,
    price: 990, // 9.90 USD in cents
    popular: false,
    description: 'Perfect for getting started',
  },
  {
    id: 'standard',
    credits: 200,
    price: 1490, // 14.90 USD in cents
    popular: true,
    description: 'Most popular package',
  },
  {
    id: 'premium',
    credits: 500,
    price: 3990, // 39.90 USD in cents
    popular: false,
    description: 'Best value for heavy users',
  },
  {
    id: 'enterprise',
    credits: 1000,
    price: 6990, // 69.90 USD in cents
    popular: false,
    description: 'Tailored for enterprises',
  },
] as const;

// free monthly credits (10% of the smallest package)
export const FREE_MONTHLY_CREDITS = 50;

// register gift credits (for new user registration)
export const REGISTER_GIFT_CREDITS = 100;

// default credit expiration days
export const CREDIT_EXPIRE_DAYS = 30;

// credit transaction type
export const CREDIT_TRANSACTION_TYPE = {
  MONTHLY_REFRESH: 'MONTHLY_REFRESH', // credits earned by monthly refresh
  REGISTER_GIFT: 'REGISTER_GIFT', // credits earned by register gift
  PURCHASE: 'PURCHASE', // credits earned by purchase
  USAGE: 'USAGE', // credits spent by usage
  EXPIRE: 'EXPIRE', // credits expired
};
