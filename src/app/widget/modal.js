import React from 'react'
import { useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

export const Modal = ({ back, full, title, action, ...props }) => {
	const history = useHistory()

	const onClose = () => {
		history.goBack()
	}

	return (
		<dialog className={full && 'full'}>
			<article>
				<header>
					<div><a onClick={onClose}><FiArrowLeft /></a></div>
					<h1>{title}</h1>
					{/* <div></div> */}
					<div>
						{action && <a className='action' onClick={action.handler} >{action.title}</a>}
					</div>
				</header>
				<section>
					{props.children}
				</section>
			</article>
		</dialog>
	)
}

export const Dialog = ({ back, full, title, action, ...props }) => {
	const history = useHistory()

	const onClose = () => {
		history.goBack()
	}

	return (
		<dialog className={full && 'full'}>
			<article>
				<header>
					<div><a onClick={onClose}><FiArrowLeft /></a></div>
					<h1>{title}</h1>
					<div></div>
					<div>
						{action && <a className='action' onClick={action.handler} >{action.title}</a>}
					</div>
				</header>
				<section>
					{props.children}
				</section>
			</article>
		</dialog>
	)
}