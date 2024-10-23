import { defineConfig, presetUno } from 'unocss';
import transformerVariantGroup from '@unocss/transformer-variant-group';

export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerVariantGroup()],
  rules: [
    [/^ts-([a-z]+)-([\.\d]+)$/, ([_, a, t]) => ({ transition: `${a} ${t}s` })],
    [/^ba$/, () => ({ border: '1px solid var(--x-border-color)' })],
    [/^bt$/, () => ({ 'border-top': '1px solid var(--x-border-color)' })],
    [/^bb$/, () => ({ 'border-bottom': '1px solid var(--x-border-color)' })],
    [/^bl$/, () => ({ 'border-left': '1px solid var(--x-border-color)' })],
    [/^br$/, () => ({ 'border-right': '1px solid var(--x-border-color)' })]
  ]
});
