import './style.css'
import vertexShader from './shaders/basic.vert.wgsl?raw'
import fragmentShader from './shaders/basic.frag.wgsl?raw'

// Create canvas element
const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.querySelector<HTMLDivElement>('#app')!.appendChild(canvas)

async function initWebGPU() {
    // Check WebGPU support
    if (!navigator.gpu) {
        throw new Error('WebGPU not supported')
    }

    // Get GPU adapter
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
    })
    if (!adapter) {
        throw new Error('No GPU adapter found')
    }

    // Get GPU device
    const device = await adapter.requestDevice()

    // Configure canvas context
    const context = canvas.getContext('webgpu')
    if (!context) {
        throw new Error('WebGPU context not available')
    }

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device: device,
        format: canvasFormat,
        alphaMode: 'premultiplied',
    })

    return { device, context, canvasFormat }
}

async function createPipeline(device: GPUDevice, canvasFormat: GPUTextureFormat) {
    // Create shader modules
    const vertexModule = device.createShaderModule({
        label: 'Vertex Shader',
        code: vertexShader
    })

    const fragmentModule = device.createShaderModule({
        label: 'Fragment Shader',
        code: fragmentShader
    })

    // Create render pipeline
    const pipeline = await device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: {
            module: vertexModule,
            entryPoint: 'main'
        },
        fragment: {
            module: fragmentModule,
            entryPoint: 'main',
            targets: [{
                format: canvasFormat
            }]
        },
        primitive: {
            topology: 'triangle-list'
        }
    })

    return pipeline
}

async function render(device: GPUDevice, context: GPUCanvasContext, pipeline: GPURenderPipeline) {
    // Create command encoder
    const commandEncoder = device.createCommandEncoder()
    
    // Get current texture view
    const textureView = context.getCurrentTexture().createView()
    
    // Create render pass
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            loadOp: 'clear',
            storeOp: 'store'
        }]
    })

    // Set pipeline and draw
    renderPass.setPipeline(pipeline)
    renderPass.draw(3) // Draw triangle (3 vertices)
    renderPass.end()

    // Submit command buffer
    device.queue.submit([commandEncoder.finish()])
}

// Initialize and start rendering
async function main() {
    try {
        const { device, context, canvasFormat } = await initWebGPU()
        const pipeline = await createPipeline(device, canvasFormat)
        
        // Render frame
        render(device, context, pipeline)
    } catch (error) {
        console.error('Error:', error)
        document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
            <div style="color: red">
                ${error}
            </div>
        `
    }
}

main()
