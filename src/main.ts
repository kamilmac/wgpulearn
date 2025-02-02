import './style.css'
import shaderCode from './shaders/shader.wgsl?raw'

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.querySelector<HTMLDivElement>('#app')!.appendChild(canvas)

async function initWebGPU() {
  if (!navigator.gpu) throw new Error('WebGPU not supported')

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
  if (!adapter) throw new Error('No GPU adapter found')

  const device = await adapter.requestDevice()
  const context = canvas.getContext('webgpu')
  if (!context) throw new Error('WebGPU context not available')

  const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
  context.configure({ device, format: canvasFormat, alphaMode: 'premultiplied' })

  return { device, context, canvasFormat }
}

async function createPipeline(device: GPUDevice, canvasFormat: GPUTextureFormat) {
  const shaderModule = device.createShaderModule({ code: shaderCode })
  return device.createRenderPipelineAsync({
    layout: 'auto',
    vertex: { module: shaderModule, entryPoint: 'vertex' },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragment',
      targets: [{ format: canvasFormat }]
    },
    primitive: { topology: 'triangle-list' }
  })
}

async function render(device: GPUDevice, context: GPUCanvasContext, pipeline: GPURenderPipeline) {
  const commandEncoder = device.createCommandEncoder()
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: 'clear',
      storeOp: 'store'
    }]
  })

  renderPass.setPipeline(pipeline)
  renderPass.draw(3)
  renderPass.end()
  device.queue.submit([commandEncoder.finish()])
}

async function startRenderLoop(device: GPUDevice, context: GPUCanvasContext, pipeline: GPURenderPipeline) {
  const frame = () => {
    render(device, context, pipeline)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

async function main() {
  try {
    const { device, context, canvasFormat } = await initWebGPU()
    const pipeline = await createPipeline(device, canvasFormat)
    await startRenderLoop(device, context, pipeline)
  } catch (error) {
    console.error('Error:', error)
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
            <div style="color: red">${error}</div>`
  }
}

main()
