

export const TextureRenderer = () => {
        // setup off screen graphics buffer
        this.shaderRenderer = new THREE.WebGLRenderTarget( TEXTURE_WIDTH, TEXTURE_HEIGHT, {
            minFilter:THREE.LinearFilter,
            magFilter:THREE.LinearFilter,
            generateMipmaps: false,
            stencilBuffer:true,
            depthBuffer:false,
            alpha: true,
            transparent:true,
            format: THREE.RGBAFormat,
      } );
      this.shaderRenderer.setSize( TEXTURE_WIDTH, TEXTURE_HEIGHT);
      textureCamera = new THREE.OrthographicCamera(TEXTURE_WIDTH / - 2, TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2, TEXTURE_HEIGHT / - 2, -1000, 100000 );
      shaderScene = new THREE.Scene();
}

export default TextureRenderer