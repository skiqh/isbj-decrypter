import './index.css';
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import svgX from './assets/x.svg'
import svgLock from './assets/lock.svg'
import svgDownload from './assets/download.svg'
import svgLoading from './assets/loading.svg'
import { PasswordSaveState } from './components/PasswordSaveState';
import { decryptFileToBlob } from './lib/decrypt';

const successSignatures = [
	// zip file (eg xlsx)
	[0x50, 0x4B, 0x03, 0x04],
	// office file (eg xls)
	[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
]
function App() {
	const [Password, setPassword] = useState('');
	const [InputFile, setInputFile] = React.useState<File | null>(null);
	const [OutputFile, setOutputFile] = React.useState<File | null>(null);
	const [OutputUrl, setOutputUrl] = React.useState<string | null>(null);
	const [SignatureMatch, setSignatureMatch] = React.useState<boolean | null>(null);


	const clearFiles = useCallback(async () => {
		setInputFile(null);
		setOutputFile(null);
		setSignatureMatch(null)
	}, []);

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		await clearFiles();
		const file0 = acceptedFiles[0];
		setInputFile(file0);
		await new Promise(x => setTimeout(x, 200))
		const outputBlob = await decryptFileToBlob(Password, file0);
		const bytes = await outputBlob.slice(0, 4).arrayBuffer()
		const fileBytes = new Uint8Array(bytes);
		const isMagicMatch = successSignatures.some(signature => {
			return signature.every((byte, index) => byte === fileBytes[index]);
		});
		setSignatureMatch(isMagicMatch)
		await new Promise(x => setTimeout(x, 200))
		setOutputFile(new File([outputBlob], 'e_' + file0.name));
		setOutputUrl(URL.createObjectURL(outputBlob));
	}, [Password, clearFiles])
	const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
		onDrop,
		noClick: true,
		// accept: {
		// 	'application/vnd.ms-excel': ['.xls'],
		// 	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
		// }
	})

	return (
		<div className='flex flex-col items-center justify-center lg:h-screen p-4 lg:p-0' {...getRootProps()}>
			<div className="flex flex-col gap-10 md:w-128">
				<PasswordSaveState onPasswordChange={password => setPassword(password)} />
				<div className={`flex flex-col gap-2 transition-opacity ${Password ? 'opacity-100' : 'opacity-0'}`}>
					<div className={`h-28 relative`}>
						{InputFile ? <button type="button" onClick={clearFiles} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center">
							<img src={svgX} />
						</button> : <div className={`absolute lg:inset-3 inset-2 border lg:rounded-xl rounded-md border-dashed pointer-events-none touch-none ${isDragActive ? 'border-blue-600' : 'border-neutral-400'}`}></div>}
						<button type="button" onClick={() => openFilePicker()} className={`flex flex-col items-center justify-center w-full h-full p-10 lg:rounded-xl rounded-lg shadow-inner ${isDragActive ? 'bg-blue-500' : 'bg-neutral-200'}`}>
							<input {...getInputProps()} />
							{
								!InputFile ? isDragActive ?
									<p>Datei hier ablegen ...</p> :
									<p><span className="hidden lg:inline">Datei hier ablegen oder anklicken, um eine Datei auszuwählen</span><span className="inline lg:hidden">Hier tippen, um eine Datei auszuwählen</span></p>
									: <div className="flex flex-col items-center justify-center w-full h-full p-10 text-xs">
										<img src={svgLock} className="mb-4" />
										{InputFile.name}
									</div>
							}
						</button>
					</div>
					<div className={`h-28 relative lg:rounded-xl rounded-lg ${SignatureMatch === null ? 'bg-neutral-200' : SignatureMatch ? 'bg-green-400' : 'bg-red-400'} flex items-center justify-center transition-shadow ${InputFile ? 'opacity-100' : 'opacity-0'} ${OutputFile ? 'shadow-md' : ''}`}>
						{InputFile && !OutputFile && <div className="flex flex-col items-center justify-center w-full h-full p-10 text-xs">
							<img src={svgLoading} className="animate-spin" />
						</div>}
						{OutputFile && OutputUrl && <>
							<a href={OutputUrl} download={OutputFile.name} className={``}>
								<div className="flex flex-col items-center justify-center w-full h-full p-10">
									<img src={svgDownload} className="mb-4" />
									<div className="text-xs text-center">{OutputFile.name}</div>
									<div className="text-[10px] text-center uppercase">
										{SignatureMatch === null ? <></> : SignatureMatch ? <span className="opacity-30">Erfolgreich entschlüsselt</span> : <span className="opacity-30">Unbekannte Datei – falsches passwort?</span>}
									</div>
								</div>
							</a>
						</>}
					</div>
				</div>
				<div className="lg:rounded-xl rounded-md flex">
					<div className="text-xs text-neutral-500 hyphens-auto flex flex-col gap-3">
						<p><strong>Die Verwendung erfolgt auf eigene Verantwortung.</strong> Bitte informiere dich umfassend über die Risiken von Verschlüs&shy;sel&shy;ungs&shy;algorithmen.</p>
						<p><strong>Deine Daten verlassen nie deinen Browser.</strong> Die Entschlüsselung erfolgt auf deinem Gerät, ohne Daten an einen Server zu senden.</p>
						<p><strong>Dein Passwort wird nur auf diesem Gerät gespeichert.</strong> Informiere dich umfassend über die Sicherheit von im Browser gespeicherten Daten.</p>
						<p><strong>Kein Tracking</strong> Die Seite verwendet keine Cookies oder ähnliche Technologien, um deine Daten zu speichern oder dein Verhalten zu verfolgen.</p>
					</div>
				</div>
			</div>
		</div >
	);
}
export default App;
