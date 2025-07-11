import { createJiti } from 'jiti';
const jiti = createJiti(import.meta.url);
jiti('./src/env');

/** @type {import('next').NextConfig} */
export default {};