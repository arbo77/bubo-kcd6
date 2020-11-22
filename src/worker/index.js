import React from 'react'

// const worker = new Worker('/worker.js')

export const useRemote = (key, worker) => {
	const [channel, setChannel] = React.useState(key)
	const [data, setData] = React.useState()
	const [item, setItem] = React.useState()

	React.useEffect(() => {
		worker.onmessage = (msg) => {
			const { data, item } = msg.data
			item !== undefined && setItem(item)
			data !== undefined && setData(data)
		}
	}, [])

	React.useEffect(() => {
		console.log({channel})
		list({
			type: channel
		})
	}, [channel])

	const send = (data) => {
		console.log({data})
		worker.postMessage({
			...data,
			channel: channel
		})
	}

	const put = (value) => {
		console.log({value, channel})
		send({
			action: 'put',
			data: {
				...value,
				type: channel
			}
		})
	}

	const set = (value) => {
		if( item === undefined) return

 		send({
			action: 'patch',
			data: {
				id: item.id,
				...value
			}
		})
	}

	const get = (value) => {
		send({
			action: 'get',
			data: value
		})
	}

	const list = (value) => {
		send({
			action: 'list',
			data: value
		})
	}

	return {
		list: data,
		selected: item,
		add: put,
		get: get,
		set: set,
		channel: (key) => {
			setChannel(key)
		}
	}
}
