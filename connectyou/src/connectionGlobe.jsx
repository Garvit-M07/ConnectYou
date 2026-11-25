import Globe from 'react-globe.gl'

function ConnectionGlobe() {
  return (
    <div className="mx-auto h-[360px] w-full max-w-[360px]">
      <Globe
        width={360}
        height={360}
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundColor="#0b1020"
      />
    </div>
  )
}

export default ConnectionGlobe