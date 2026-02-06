
const MainHeading = ({title, subTitle}: {title: string, subTitle: string}) => {
    return (
      <div className="text-center mb-4">
          <p className="text-gray-500 uppercase font-semibold leading-4">{subTitle}</p>
          <h2 className="text-4xl font-bold text-primary italic">{title}</h2>
      </div>
    )
  }
  
  export default MainHeading