import React from "react"
import CyberpunkModal from "../../dumb/CyberPunkModal"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons"

/**
 * ResumeModal - Displays CV/resume PDF
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onClose - Callback when modal is closed
 */
const ResumeModal = ({ show, onClose }) => {
	return (
		<CyberpunkModal show={show} close={onClose}>
			<>
				<h1>
					<a
						target='_blank'
						rel='noreferrer'
						href='./Joel Kinman resume.pdf'
					>
						save pdf <FontAwesomeIcon icon={faFileArrowDown} />
					</a>
				</h1>
				<div className='resume'>
					<object
						data='./Joel Kinman resume.pdf'
						type='application/pdf'
						width='90%'
						height='90%'
					>
						<p>
							Your web browser doesn't have a PDF plugin.
							<a href='./Joel Kinman resume.pdf'>
								click here to download the PDF file.{" "}
								<FontAwesomeIcon icon={faFileArrowDown} />
							</a>
						</p>
					</object>
				</div>
			</>
		</CyberpunkModal>
	)
}

export default ResumeModal

