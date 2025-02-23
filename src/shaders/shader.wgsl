struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertex(
    @builtin(vertex_index) vertexIndex: u32
) -> VertexOutput {
    // Rectangle vertices (80x40 pixels converted to clip space coordinates)
    var pos = array<vec2f, 6>(
        // First triangle
        vec2f(-0.1, 0.05),  // top left
        vec2f(-0.1, -0.05), // bottom left
        vec2f(0.1, 0.05),   // top right
        // Second triangle
        vec2f(-0.1, -0.05), // bottom left
        vec2f(0.1, -0.05),  // bottom right
        vec2f(0.1, 0.05)    // top right
    );

    // All vertices red
    var color = vec3f(1.0, 0.0, 0.0);

    var output: VertexOutput;
    output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    output.color = vec4f(color, 1.0);
    return output;
}

@fragment
fn fragment(
    @location(0) color: vec4f
) -> @location(0) vec4f {
    return color;
}
