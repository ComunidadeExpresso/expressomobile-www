<?php
// Set return header to json
header('Content-Type: application/json');

// Get crossdomain
$crossdomain = $_GET['crossdomain'];
unset($_GET['crossdomain']);

// Get current resource
$resource = $_GET['resource'];
unset($_GET['resource']);

// Implode webservice url
$url = implode('/',array(trim($crossdomain,"/ "),trim($resource,"/ ")));

// Init cURL
$curl = curl_init() or die(curl_error());


// Set default options
curl_setopt_array($curl, array(
	CURLOPT_FAILONERROR		=> true,
	CURLOPT_RETURNTRANSFER	=> true,
	CURLOPT_SSL_VERIFYHOST	=> false,
	CURLOPT_SSL_VERIFYPEER	=> false,
));


// Choose request method
switch ($_SERVER['REQUEST_METHOD']) {
	case 'GET':

		// Pass parameters by get url
		$data = "id=".$_POST['id']."&params=" . stripslashes(json_encode($_POST['params']));
		curl_setopt($curl, CURLOPT_URL, $url.'?'.$data);
		$result = curl_exec($curl);
		break;
	case 'POST':

		curl_setopt($curl, CURLOPT_URL, $url);


		$newPost['id'] = $_POST['id'];
		$newPost['params'] = $_POST['params'];

		foreach ($newPost['params'] as $i => $value) {
			$newPost['params'][$i] = htmlentities(mb_convert_encoding($_POST['params'][$i],"ISO-8859-1","UTF-8"));
		}

		$newPost['params'] = stripslashes(mb_convert_encoding(html_entity_decode(json_encode($newPost['params'])),"UTF-8","ISO-8859-1" ));

		 if ($_FILES) {

			$i = 1;
			foreach ($_FILES as $file) {
				move_uploaded_file($file['tmp_name'], dirname($file['tmp_name']) . '/' . $file['name']);
				$newPost['file_' . $i] = '@' . dirname($file['tmp_name']) . '/' . $file['name'];
				$i = $i + 1;
			}

		}
		curl_setopt($curl, CURLOPT_POSTFIELDS, $newPost);

		$result = curl_exec($curl);
		break;
	default: break;
}
echo ($result && !curl_errno($curl))? $result : curl_error($curl);

// Close cURL
curl_close($curl);
