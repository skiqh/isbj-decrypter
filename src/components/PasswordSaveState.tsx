import { useCallback, useEffect, useState } from 'react';
import svgEdit2 from '../assets/edit-2.svg'
import svgSave from '../assets/save.svg'

type PasswordSaveStateProps = {
	onPasswordChange: (password: string) => void;
};

export const PasswordSaveState: React.FC<PasswordSaveStateProps> = ({ onPasswordChange }) => {

	const [Password, setPassword] = useState(localStorage.getItem('password') || '');
	const [PasswordChanged, setPasswordChanged] = useState(false);
	const [PasswordSaved, setPasswordSaved] = useState(false);

	useEffect(() => {
		onPasswordChange(Password);
	}, [Password, onPasswordChange]);

	useEffect(() => {
		const lsPassword = localStorage.getItem('password');
		setPasswordChanged(Password !== lsPassword);
	}, [Password]);


	useEffect(() => {
		const check = () => {
			const lsPassword = localStorage.getItem('password');
			setPasswordChanged(Password !== lsPassword);
			setPasswordSaved(!!lsPassword);
		}
		check()
		const interval = setInterval(check, 1000);
		return () => clearInterval(interval);
	}, [Password]);

	const saveSettings = useCallback(() => {
		localStorage.setItem('password', Password);
		setPasswordChanged(false);
		setPasswordSaved(true);
	}, [Password]);

	const deleteSettings = useCallback(() => {
		localStorage.removeItem('password');
		setPassword('');
		setPasswordSaved(false);
	}, []);
	return (
		<div className="flex-1 relative flex flex-row">
			<input type="password" tabIndex={1} value={Password} onChange={(e) => setPassword(e.target.value)} className="px-3 py-1 flex-1 bg-neutral-200 shadow-inner rounded-md" />
			<div className='absolute right-1 flex flex-row items-center h-full text-xs'>
				{!Password ? <div className="opacity-30 mr-2">Bitte gib dein Passwort ein</div> : PasswordChanged ? <div className="flex flex-row items-center"><img src={svgEdit2} className="w-4 h-4 mr-1" /><button type="button" onClick={saveSettings} className="bg-blue-500 text-white rounded-xs px-2 py-1">Passwort speichern</button></div> : PasswordSaved ? <div className="group flex flex-row"><div className="flex flex-row items-center opacity-30 mr-2 group-hover:hidden"><img src={svgSave} className="w-4 h-4 mr-1" />gespeichert</div><button type='button' onClick={deleteSettings} className="flex lg:hidden flex-row items-center lg:group-hover:flex bg-red-500 text-white rounded-xs px-2 py-1">Passwort löschen</button></div> : ''}
			</div>
		</div>
	);
};
